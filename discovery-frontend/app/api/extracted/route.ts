import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mergeProjectAnalysis } from "@/lib/mergeProjectAnalysis";

/**
 * GET /api/extracted
 * Fetches all extracted data from the database with optional filtering
 *
 * Query Parameters:
 * - projectId: number (REQUIRED - filter by project: 1, 2, 3, 4, etc)
 * - limit: number (default: 100, max: 1000)
 * - offset: number (default: 0)
 * - status: string (filter by status: 'processing', 'completed', 'failed', 'error')
 * - search: string (search in filename)
 * - sort: 'newest' | 'oldest' (default: 'newest')
 * - include_analysis: boolean (include full analysis_results in response, default: true)
 *
 * NOTE: the `extracted` table has two similarly-named columns — `project_id`
 * (uuid, unused/empty) and `projectId` (int2, the one that actually holds
 * data). This route filters on `projectId` — do not swap this back to
 * `project_id` or every query will fail with "invalid input syntax for
 * type uuid" whenever a plain integer project id is passed in.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Query parameters
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required", code: "MISSING_PROJECT_ID" },
        { status: 400 }
      );
    }

    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 1000);
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const includeAnalysis = searchParams.get("include_analysis") !== "false";

    // Build query
    let query = supabase
      .from("extracted")
      .select(includeAnalysis ? "*" : "id, filename, filetype, file_size_bytes, status, created_at, document_id, projectId", {
        count: "exact",
      });

    // Filter by project (REQUIRED)
    // Uses the int2 "projectId" column — NOT the unused uuid "project_id" column
    query = query.eq("projectId", parseInt(projectId));

    // Apply filters (chainable with AND logic)
    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.ilike("filename", `%${search}%`);
    }

    // Apply sorting
    const ascending = sort === "oldest";
    query = query.order("created_at", { ascending });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    const mergedAnalysis = mergeProjectAnalysis(data || []);

    if (error) {
      console.error("Database query error:", error);
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 }
      );
    }

    const rows =
      data && data.length > 1
        ? [mergeProjectAnalysis(data)]
        : (data ?? []);

    return NextResponse.json({
      success: true,
      total: count || 0,
      limit,
      offset,
      rows,
      filters: {
        status: status || null,
        search: search || null,
      },
      pagination: {
        current_page: Math.floor(offset / limit) + 1,
        total_pages: Math.ceil((count || 0) / limit),
        has_more: offset + limit < (count || 0),
      },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to fetch extracted data", details: String(err) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/extracted/search
 * Advanced search for extracted documents
 *
 * Body:
 * {
 *   "projectId": 1,
 *   "query": "string to search",
 *   "filters": {
 *     "status": "completed" | "processing" | "failed" | "error",
 *     "filetype": "pdf" | "docx" | "csv" | "txt",
 *     "date_from": "2024-01-01",
 *     "date_to": "2024-12-31"
 *   },
 *   "limit": 20,
 *   "offset": 0
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, query, filters = {}, limit = 20, offset = 0 } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required", code: "MISSING_PROJECT_ID" },
        { status: 400 }
      );
    }

    let dbQuery = supabase
      .from("extracted")
      .select("id, filename, filetype, status, created_at, document_id, metadata, projectId", {
        count: "exact",
      });

    // Filter by project (REQUIRED) - this must be first
    // Uses the int2 "projectId" column — NOT the unused uuid "project_id" column
    dbQuery = dbQuery.eq("projectId", parseInt(projectId));

    // Search in filename
    // Note: We use ilike (case-insensitive) instead of .or() to maintain AND logic with projectId
    // The .or() operator in Supabase PostgREST can overwrite previous filters, so we avoid it here
    if (query) {
      dbQuery = dbQuery.ilike("filename", `%${query}%`);
    }

    // Apply additional filters
    if (filters.status) {
      dbQuery = dbQuery.eq("status", filters.status);
    }

    if (filters.filetype) {
      dbQuery = dbQuery.eq("filetype", filters.filetype);
    }

    if (filters.date_from) {
      dbQuery = dbQuery.gte("created_at", filters.date_from);
    }

    if (filters.date_to) {
      dbQuery = dbQuery.lte("created_at", filters.date_to);
    }

    // Pagination
    dbQuery = dbQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      total: count || 0,
      rows: data || [],
      query,
      filters,
      projectId,
    });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: "Failed to search", details: String(err) },
      { status: 500 }
    );
  }
}