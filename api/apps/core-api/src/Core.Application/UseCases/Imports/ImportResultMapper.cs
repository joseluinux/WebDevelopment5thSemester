using System.Text.Json;
using Core.Infrastructure;

namespace Core.Application.UseCases.Imports;

// Centralised entity -> DTO mapping for the Imports slice.
//
// Keeping the mapping in one place means the three handlers (List, Get,
// Create) all return the same shape, and any future field added to
// ImportResult only needs to be wired here once.
internal static class ImportResultMapper
{
    // Translates an Import entity to its wire DTO.
    //
    // The Errors column is jsonb-encoded. We parse it back into a list
    // for the wire so the client doesn't have to second-guess the
    // encoding. Parse failures are downgraded to a single-element list
    // containing the raw text — better to surface the bad data than to
    // throw and 500 a perfectly viewable status response.
    public static ImportResult ToResult(Import entity)
    {
        IReadOnlyList<string>? errors = null;
        if (!string.IsNullOrWhiteSpace(entity.Errors))
        {
            try
            {
                errors = JsonSerializer.Deserialize<List<string>>(entity.Errors);
            }
            catch (JsonException)
            {
                // Defensive: if a row was written by hand (or by an
                // older code path) and isn't valid JSON, return it raw
                // instead of failing the read.
                errors = new[] { entity.Errors };
            }
        }

        return new ImportResult(
            entity.Id,
            entity.MeiId,
            entity.FileUri,
            entity.Status,
            entity.TotalRows,
            entity.ProcessedRows,
            errors,
            entity.CreatedAt,
            entity.UpdatedAt);
    }
}
