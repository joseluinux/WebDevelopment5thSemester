using Resend;

namespace CoreApi.Extensions;

// Small DI helper that wires up the Resend SDK 0.5.0 in one line.
//
// The base Resend NuGet package (0.5.0) does NOT ship an AddResend()
// extension — only the lower-level IResend / ResendClient /
// ResendClientOptions. This shim provides the conventional one-liner so
// the composition root stays readable:
//
//     builder.Services.AddResend(o => o.ApiToken = ...);
//
// Under the hood we:
//   - Configure ResendClientOptions from the caller's lambda.
//   - Register ResendClient as the IResend implementation using
//     AddHttpClient<,>, which gives the client a pooled HttpClient
//     managed by IHttpClientFactory (the recommended way to consume HTTP
//     services in ASP.NET Core — avoids socket exhaustion).
public static class ResendServiceCollectionExtensions
{
    public static IServiceCollection AddResend(
        this IServiceCollection services,
        Action<ResendClientOptions> configure)
    {
        services.Configure(configure);
        // AddHttpClient<IResend, ResendClient> registers both the typed
        // HttpClient and the service mapping — exactly what
        // ResendClient(IOptionsSnapshot<ResendClientOptions>, HttpClient)
        // needs.
        services.AddHttpClient<IResend, ResendClient>();
        return services;
    }
}
