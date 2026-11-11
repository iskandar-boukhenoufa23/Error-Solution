import json
from functools import lru_cache
from pathlib import Path


@lru_cache(maxsize=1)
def _load_resources():
	import faiss
	from sentence_transformers import SentenceTransformer

	data_dir = Path(__file__).resolve().parents[1] / "data"
	index_path = data_dir / "error.index"
	metadata_path = data_dir / "metadata.json"
	if not index_path.is_file() or not metadata_path.is_file():
		raise FileNotFoundError("The error knowledge base has not been installed")

	index = faiss.read_index(str(index_path))
	with metadata_path.open(encoding="utf-8") as metadata_file:
		metadata = json.load(metadata_file)
	model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
	return model, index, metadata


def search(query, top_k=5):
	model, index, metadata = _load_resources()
	if index.ntotal == 0:
		return []

	query_embedding = model.encode(
		[query], normalize_embeddings=True, convert_to_numpy=True
	).astype("float32")
	scores, indices = index.search(query_embedding, min(top_k, index.ntotal))
	results = []

	for score, index_position in zip(scores[0], indices[0]):
		if index_position < 0:
			continue
		if isinstance(metadata, list):
			if index_position >= len(metadata):
				continue
			item = metadata[index_position]
		else:
			item = metadata.get(str(index_position), metadata.get(index_position))
		if item is not None:
			results.append({"score": float(score), "data": item})

	return results
