import pandas as pd

def extract(path):
    df = pd.read_csv(path)

    return df.to_csv(index=False)