# Mode: export — Data Exporter (JSON, CSV, Markdown)

Exports filtered or sorted relocation deals into structured interchange formats for reporting, spreadsheets, or programmatic downstream pipelines.

## CLI Invocation

```bash
# Export all deals as JSON to stdout
reloc export --format json

# Export deals to a JSON file
reloc export --format json --output data/relocations_export.json

# Export deals to a spreadsheet-ready CSV file
reloc export --format csv --output data/relocations.csv

# Export deals to a GitHub Flavored Markdown table
reloc export --format md --output data/relocations.md

# Export with specific filters (e.g. only campervans to Portugal)
reloc export --format md --vehicle campervan --destination Portugal --output data/campers_portugal.md
```

## Supported Export Formats

| Format | Option | Description |
|---|---|---|
| **JSON** | `--format json` | Full fidelity canonical array of `RelocationDeal` objects |
| **CSV** | `--format csv` | RFC-4180 compliant CSV file suitable for Excel, Google Sheets, or LibreOffice |
| **Markdown** | `--format md` | Formatted table document with active booking links |
