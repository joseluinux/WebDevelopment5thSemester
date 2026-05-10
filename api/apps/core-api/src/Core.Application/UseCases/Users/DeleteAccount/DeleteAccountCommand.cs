namespace Core.Application.UseCases.Users.DeleteAccount;

// Input for DELETE /v1/users/me.
//
// UserId comes from the JWT — a user can only delete THEIR OWN account.
// There is no admin-deletes-anyone flow in this slice; if that becomes a
// requirement later, it gets a separate route, separate handler, and a
// distinct authorisation policy.
public record DeleteAccountCommand(Guid UserId);
