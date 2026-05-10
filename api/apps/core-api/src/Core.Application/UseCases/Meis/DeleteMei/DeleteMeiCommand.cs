namespace Core.Application.UseCases.Meis.DeleteMei;

// Input for deleting a MEI. Same UserId-from-JWT, MeiId-from-URL pattern as
// GetMei/UpdateMei.
public record DeleteMeiCommand(Guid UserId, Guid MeiId);
