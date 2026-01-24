import os

EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    "__pycache__",
    "dist",
    "build",
    ".next",
    ".vscode",
    "Test"
}

EXCLUDE_FILES = {
    ".env",
    ".env.local",
    ".DS_Store",
    "project_dump.txt"
}

ALLOWED_EXTENSIONS = {
    ".js", ".ts", ".jsx", ".tsx",
    ".html", ".css", ".scss",
    ".json", ".md",
    ".sql",
    ".py",
    ".yml", ".yaml"
}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_FILE = os.path.join(SCRIPT_DIR, "project_dump.txt")


def is_allowed_file(filename):
    name, ext = os.path.splitext(filename)
    return ext in ALLOWED_EXTENSIONS


def extract_project(root_dir):
    with open(OUTPUT_FILE, "w", encoding="utf-8", errors="ignore") as out:
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            for file in files:
                if file in EXCLUDE_FILES:
                    continue
                if not is_allowed_file(file):
                    continue

                file_path = os.path.join(root, file)

                out.write("\n" + "=" * 70 + "\n")
                out.write(f"FILE: {os.path.relpath(file_path, root_dir)}\n")
                out.write("=" * 70 + "\n")

                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        out.write(f.read())
                except Exception as e:
                    out.write(f"\n[ERROR READING FILE: {e}]\n")


if __name__ == "__main__":
    extract_project(PROJECT_ROOT)
    print("✅ Project extracted (binary files skipped)")
