namespace Core.Application.Interfaces;

// Abstraction the application layer uses to put bytes into object
// storage and get back a URL the FastAPI service can read.
//
// Why an interface:
//   - The handler stays decoupled from Supabase Storage specifically. A
//     future migration to S3 / Cloudflare R2 / Azure Blob is one new
//     implementation away.
//   - Tests can substitute an in-memory shim that returns a fake URL.
//   - Core.Application stays free of HttpClient and Supabase types.
//
// The contract is intentionally small — one method, no list / delete /
// signed-URL helpers — because the slice only needs upload-and-go. More
// surface gets added when a use case actually needs it.
public interface IStorageService
{
    // Uploads a single file and returns a URL that any HTTP client (in
    // particular, the FastAPI worker) can use to download it.
    //
    // Implementations are responsible for whatever auth / encoding the
    // backend requires. The caller passes:
    //   - bucketName: the storage bucket / container.
    //   - fileName: the key inside the bucket. Should already be
    //     uniquified by the caller (e.g. prefixed with the import id) to
    //     avoid collisions and accidental overwrites.
    //   - fileStream: the bytes. The implementation reads it once.
    //   - contentType: the MIME type to attach to the upload. Improves
    //     downstream behaviour (FastAPI can branch on it; browsers
    //     preview it correctly when surfaced in a UI).
    Task<string> UploadFileAsync(
        string bucketName,
        string fileName,
        Stream fileStream,
        string contentType,
        CancellationToken cancellationToken = default);
}
