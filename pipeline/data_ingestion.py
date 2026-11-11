import kagglehub
import shutil

# Download latest version
path = kagglehub.dataset_download("stackoverflow/stacksample")

print("Path to dataset files:", path)


dst_path = "data"


shutil.copytree(path, dst_path, dirs_exist_ok=True)


print(f"Successfully copied dataset from {path} to {dst_path}")

