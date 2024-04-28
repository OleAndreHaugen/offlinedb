Open Edition Offline DB for large files

Use when having large files database needed to be stored offline, example large PDF's.

How to use:

# Declare a new Offline DB
const Files = new OfflineDB("Files");

# Save
await Files.save(id, content);

# Get 
await Files.get(id);

# Delete
await Files.delete(id);

# List content id's
await Files.list();

# Clear entire database
await Files.clear();
