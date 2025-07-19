#!/bin/bash

# Find all TypeScript, JavaScript, and TSX files
echo "Adding comments to code files..."

find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  -not -name "*.d.ts" \
  -not -name "*.config.*" \
  -not -name "*.json" \
  -not -name "*.css" \
  -not -name "*.md" \
  -not -name "*.lock" \
  -not -name "*.log" \
  -not -name "*.ejs" \
  -not -name "*.html" \
  -not -name "*.css" \
  -not -name "*.ico" \
  -not -name "*.svg" | while read -r file; do
  
  # Check if file already has the comment
  if ! grep -q "^// abc$" "$file"; then
    # Add comment to the top of the file
    echo "// abc" > temp_file
    cat "$file" >> temp_file
    mv temp_file "$file"
    echo "Added comment to: $file"
  else
    echo "Skipped (already has comment): $file"
  fi
done

echo "Done!"
