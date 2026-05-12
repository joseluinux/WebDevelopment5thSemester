using Core.Application.DTOs;

namespace Core.Application.Interfaces;

// Abstraction the application layer uses to talk to the FastAPI
// classification service.
//
// Why an interface (not a direct dependency on HttpClient in handlers):
//   1. CreateImportHandler stays pure and unit-testable — no real network
//      call is made when the test suite swaps in a Moq.
//   2. The transport (HTTP today, gRPC tomorrow, or even an in-process
//      shim during development) can be changed without touching any
//      handler.
//   3. Core.Application stays free of HttpClient / JSON / settings types.
public interface IFastApiService
{
    // Sends one import job to the FastAPI service and returns the parsed
    // response. The implementation is responsible for serialising the
    // request body and deserialising the JSON reply.
    //
    // Parameters use string for ids — we cross a process boundary, and
    // FastAPI does its own validation. Converting to/from Guid is left
    // to the caller, which keeps the contract dumb.
    //
    // Throws on transport failure (network down, non-2xx status). The
    // handler catches and turns those into an Import row with status
    // "error" instead of letting the request hang or silently succeed.
    Task<ImportResponse> ProcessImportAsync(
        string importId,
        string meiId,
        string fileUrl,
        CancellationToken cancellationToken = default);
}
