s = input().strip()  # Input string
seen = set()
result = None
for char in s:
    if char in seen:
        result = char
        break
    seen.add(char)
print(result)
