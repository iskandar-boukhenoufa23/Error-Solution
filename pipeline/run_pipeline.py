from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import json
import ijson
import os


data = "data"


BATCH_SIZE = 256
MAX_ITEMS = 10000
PROGRESS_FILE = f"{data}/progress.txt"
INDEX_FILE = f"{data}/error.index"
METADATA_FILE = f"{data}/metadata.json"

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


# Load progress
start_index = 0
if os.path.exists(PROGRESS_FILE):
    with open(PROGRESS_FILE) as f:
        start_index = int(f.read().strip())


# Load or create index
if os.path.exists(INDEX_FILE) and os.path.exists(METADATA_FILE):
    index = faiss.read_index(INDEX_FILE)
    with open(METADATA_FILE) as f:
        metadata_map = json.load(f)
    print(f"[INFO] Loaded existing index with {index.ntotal} vectors")

else:
    index = None
    metadata_map = []
    print("[INFO] Creating new index")

texts = []
batch_meta = []
count = 


with open(DATA_FILE, "rb") as f:
    parser = ijson.items(f, "item")

    for i, entry in enumerate(parser):
        if i < start_index:
            continue
        if count >= MAX_ITEMS:
            break
        
        text = f"{entry['pattern']} {entry['error_messages']}"
        texts.append(text)

        batch_meta.append({
            "pattern": entry["pattern"],
            "error": entry["error_messages"],
            "fix": entry["fix"],
            "example": entry["example"]
        })

        count += 1

        if len(texts) == BATCH_SIZE:
            embeddings = model.encode(
                texts,
                normalize_embeddings=True,
                convert_to_numpy=True
            ).astype("float32")

            if index is None:
                d = embeddings.shape[1]
                index = faiss.IndexFlatIP(d)  # cosine similarity
            else:
                assert index.d == embeddings.shape[1]
            
            index.add(embeddings)
            metadata_map.extend(batch_meta)

            texts.clear()
            batch_meta.clear()

# Flush remaining
if texts:
    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
        convert_to_numpy=True
    ).astype("float32")

    if index is None:
        index = faiss.IndexFlatIP(embeddings.shape[1])
    
    index.add(embeddings)
    metadata_map.extend(batch_meta)


# Save state
faiss.write_index(index, INDEX_FILE)
with open(METADATA_FILE, "w") as f:
    json.dump(metadata_map, f)

with open(PROGRESS_FILE, "w") as f:
    f.write(str(start_index + count))

print(f"[DONE] Indexed {count} new items")
print(f"[TOTAL] {index.ntotal} vectors in index")


