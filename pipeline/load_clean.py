import pandas as pd
from bs4 import BeautifulSoup
import re
import json


data = "data"
error_patterns = []


DATA_FILE = f"{data}/error_patterns.json"


answers = pd.read_csv(f'{data}/Answers.csv', encoding='latin-1')
questions = pd.read_csv(f'{data}/Questions.csv', encoding='latin-1')
tags = pd.read_csv(f'{data}/Tags.csv', encoding='latin-1')


answers_grouped = answers.groupby('ParentId')['Body'].apply(list).reset_index()
questions_full = questions.merge(answers_grouped, left_on='Id', right_on='ParentId', how='left')

tags_grouped = tags.groupby('Id')['Tag'].apply(list).reset_index()
questions_full = questions_full.merge(
    tags_grouped,
    left_on='Id',
    right_on='Id',
    how='left'
)


questions_full = questions_full.drop(columns=['OwnerUserId', 'CreationDate', 'ClosedDate'])



def fix_code_extract(line):
  soup = BeautifulSoup(line)


  code_blocks = [c.get_text() for c in soup.find_all('code')]

  plain_text = soup.get_text().strip()

  example = code_blocks[0] if code_blocks else None

  fix = plain_text

  if example:
    return example, fix

  return fix


def clean(line):
    line = line.strip().lower()
    line = re.sub(r'\/[\w\.\/-]+', 'PATH', line)
    line = re.sub(r'line: \s*\d+', 'LINE', line)

    return line


for idx, row_data in questions_full.iterrows():
    tags = row_data['Tag']
    title = row_data['Title']
    error_message = row_data['Body_x']
    answer = row_data['Body_y']

    pattern = ''
    if isinstance(tags, list) and len(tags) > 0:
        cleaned_tags = [str(tag) for tag in tags if pd.notna(tag)]
        if len(cleaned_tags) > 0:
        tags_part = '[' + ', '.join(cleaned_tags) + ']'
        pattern =  f"{tags_part} {title}"
        else:
        pattern = title
    else:
        pattern = title

    extracted_data = fix_code_extract(error_message)
    if isinstance(extracted_data, tuple):
        example, fix = extracted_data
    else:
        example = None
        fix = extracted_data

    # Ensure fix is not NaN (convert to None if it is)
    if pd.isna(fix):
        fix = None

    # Ensure answer is not NaN (convert to None if it is)
    if isinstance(answer, list):
        answer = [item if pd.notna(item) else None for item in answer]
    elif pd.isna(answer):
        answer = None

    if pd.isna(example):
        example = None

    error_patterns.append({
        "pattern": pattern,
        "error_messages": error_message,
        "fix": answer,
        "example": example
    })


with open(DATA_FILE, 'w') as f:
    json.dump(error_patterns, f)

