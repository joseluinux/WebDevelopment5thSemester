using System.Text;
using Core.Application.Auth;
using Core.Application.Interfaces;
using Core.Application.UseCases.Ai.GetAiContext;
using Core.Application.UseCases.Ai.GetFinancialSummary;
using Core.Application.UseCases.Auth.ForgotPassword;
using Core.Application.UseCases.Auth.GetMe;
using Core.Application.UseCases.Auth.Login;
using Core.Application.UseCases.Auth.Logout;
using Core.Application.UseCases.Auth.Refresh;
using Core.Application.UseCases.Auth.Register;
using Core.Application.UseCases.Auth.ResetPassword;
using Core.Application.UseCases.Employees.CreateEmployee;
using Core.Application.UseCases.Employees.GetEmployees;
using Core.Application.UseCases.Imports.CreateImport;
using Core.Application.UseCases.Imports.GetImport;
using Core.Application.UseCases.Imports.GetImports;
using Core.Application.UseCases.Meis.CreateMei;
using Core.Application.UseCases.Meis.DeleteMei;
using Core.Application.UseCases.Meis.GetMei;
using Core.Application.UseCases.Meis.GetMeis;
using Core.Application.UseCases.Meis.UpdateMei;
using Core.Application.UseCases.Products.CreateProduct;
using Core.Application.UseCases.Products.DeleteProduct;
using Core.Application.UseCases.Products.GetProduct;
using Core.Application.UseCases.Products.GetProducts;
using Core.Application.UseCases.Products.UpdateProduct;
using Core.Application.UseCases.Transactions.CreateTransaction;
using Core.Application.UseCases.Transactions.DeleteTransaction;
using Core.Application.UseCases.Transactions.GetTransaction;
using Core.Application.UseCases.Transactions.GetTransactions;
using Core.Application.UseCases.Transactions.UpdateTransaction;
using Core.Application.UseCases.Users.DeleteAccount;
using Core.Application.UseCases.Users.GetProfile;
using Core.Application.UseCases.Users.UpdateProfile;
using Core.Domain.Interfaces;
using Core.Infrastructure.Persistence;
using Core.Infrastructure.Persistence.Repositories;
using Core.Infrastructure.Services;
using CoreApi.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Define the security scheme for JWT Bearer authentication
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token (without 'Bearer ' prefix)"
    });

    // Apply the security scheme globally to all endpoints.
    //
    // Microsoft.OpenApi 2.x (shipped with Swashbuckle.AspNetCore 10.x) reshaped
    // this API in three ways:
    //   1. OpenApiSecurityScheme.Reference and the OpenApiReference class were
    //      removed. References live in dedicated types — here,
    //      OpenApiSecuritySchemeReference.
    //   2. OpenApiSecurityRequirement is now a Dictionary<…, List<string>>, so
    //      the empty-scopes value must be a real List<string>, not Array.Empty.
    //   3. AddSecurityRequirement now expects a factory
    //      (Func<OpenApiDocument, OpenApiSecurityRequirement>) instead of the
    //      requirement instance — the document is supplied at generation time.
    options.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer"),
            new List<string>()
        }
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Bind the "JwtSettings" section of appsettings.json to the strongly-typed POCO.
// We then expose JwtSettings DIRECTLY in the container (not just IOptions<JwtSettings>)
// so handlers can take a plain JwtSettings dependency — that keeps Core.Application
// free of Microsoft.Extensions.Options coupling at the call site and makes unit tests
// trivial (just `new JwtSettings { ... }`).
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.AddSingleton(sp => sp.GetRequiredService<IOptions<JwtSettings>>().Value);

// Configure JwtBearer authentication using the SAME JwtSettings instance the
// LoginHandler signs tokens with. Issuer/audience/key drift between signer and
// validator is a classic auth bug — sharing the POCO removes the risk.
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()
                  ?? throw new InvalidOperationException("Missing JwtSettings configuration section.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Every claim a downstream policy might trust must be validated here.
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,

            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),

            // Expired tokens must be rejected; ClockSkew = 0 makes the expiry
            // exact (default is 5 minutes of slack, which we don't want).
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Repositories and handlers are registered manually (no MediatR). Each new use case
// gets one extra line here — explicit and trivial to discover.
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IMeiRepository, MeiRepository>();
builder.Services.AddScoped<RegisterHandler>();
builder.Services.AddScoped<LoginHandler>();
builder.Services.AddScoped<GetMeHandler>();
builder.Services.AddScoped<RefreshHandler>();
builder.Services.AddScoped<LogoutHandler>();
builder.Services.AddScoped<GetMeisHandler>();
builder.Services.AddScoped<GetMeiHandler>();
builder.Services.AddScoped<CreateMeiHandler>();
builder.Services.AddScoped<UpdateMeiHandler>();
builder.Services.AddScoped<DeleteMeiHandler>();
builder.Services.AddScoped<GetProfileHandler>();
builder.Services.AddScoped<UpdateProfileHandler>();
builder.Services.AddScoped<DeleteAccountHandler>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<GetTransactionsHandler>();
builder.Services.AddScoped<GetTransactionHandler>();
builder.Services.AddScoped<CreateTransactionHandler>();
builder.Services.AddScoped<UpdateTransactionHandler>();
builder.Services.AddScoped<DeleteTransactionHandler>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<GetProductsHandler>();
builder.Services.AddScoped<GetProductHandler>();
builder.Services.AddScoped<CreateProductHandler>();
builder.Services.AddScoped<UpdateProductHandler>();
builder.Services.AddScoped<DeleteProductHandler>();
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<GetEmployeesHandler>();
builder.Services.AddScoped<CreateEmployeeHandler>();

// Imports slice — repository, three handlers, and the two outbound
// HTTP services (FastAPI classifier + Supabase Storage uploader).
//
// Settings POCOs are bound and re-registered as plain instances (same
// pattern as JwtSettings / ResendSettings) so the implementations can
// take a typed dependency without coupling to IOptions at the call
// site — keeps Core.Infrastructure unit-testable with `new
// FastApiSettings { ... }`.
builder.Services.Configure<FastApiSettings>(builder.Configuration.GetSection("FastApi"));
builder.Services.AddSingleton(sp => sp.GetRequiredService<IOptions<FastApiSettings>>().Value);
builder.Services.Configure<SupabaseStorageSettings>(builder.Configuration.GetSection("SupabaseStorage"));
builder.Services.AddSingleton(sp => sp.GetRequiredService<IOptions<SupabaseStorageSettings>>().Value);

builder.Services.AddScoped<IImportRepository, ImportRepository>();

// Typed HttpClients via IHttpClientFactory — pooled handlers, no
// socket exhaustion, retries / Polly can be added later in one place.
//
// FastAPI gets a 5-minute timeout because LLM classification of a
// large file can legitimately take a while; the default of 100 s
// would surface as transient "transport error" Imports for normal
// usage. 5 minutes still bounds the request so a hung worker
// doesn't tie up a connection forever.
builder.Services.AddHttpClient<IFastApiService, FastApiService>(client =>
{
    client.Timeout = TimeSpan.FromMinutes(5);
});

// SupabaseStorage — registered as a NAMED HttpClient + manual factory.
// The typed-client overload (AddHttpClient<IService, TImpl>) resolves
// constructor parameters via ActivatorUtilities, but here we want
// SupabaseStorageSettings (a plain singleton) to be looked up
// explicitly so the wiring is obvious and a missing settings
// registration fails with a loud, locatable error instead of a
// confusing activation exception.
builder.Services.AddHttpClient("SupabaseStorage");
builder.Services.AddScoped<IStorageService>(sp =>
{
    var httpClientFactory = sp.GetRequiredService<IHttpClientFactory>();
    var httpClient = httpClientFactory.CreateClient("SupabaseStorage");
    var settings = sp.GetRequiredService<SupabaseStorageSettings>();
    return new SupabaseStorageService(httpClient, settings);
});

builder.Services.AddScoped<CreateImportHandler>();
builder.Services.AddScoped<GetImportsHandler>();
builder.Services.AddScoped<GetImportHandler>();

// AI Context — read-only aggregations on top of the existing
// transaction / product / employee / MEI repositories. No new
// repositories or settings needed; the handlers compose what is
// already registered above.
builder.Services.AddScoped<GetAiContextHandler>();
builder.Services.AddScoped<GetFinancialSummaryHandler>();

// Forgot/Reset password — repository, email service, and handlers.
builder.Services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
builder.Services.AddScoped<ForgotPasswordHandler>();
builder.Services.AddScoped<ResetPasswordHandler>();

// Resend wiring.
//   - AddResend() (our small helper) registers IResend + HttpClient and
//     binds the ApiToken from configuration.
//   - The Resend section also carries FromEmail, which the email service
//     reads via a separately registered ResendSettings POCO.
builder.Services.AddResend(options =>
    options.ApiToken = builder.Configuration["Resend:ApiKey"] ?? string.Empty);
builder.Services.AddSingleton(new ResendSettings
{
    ApiKey = builder.Configuration["Resend:ApiKey"] ?? string.Empty,
    FromEmail = builder.Configuration["Resend:FromEmail"] ?? string.Empty
});
builder.Services.AddScoped<IEmailService, ResendEmailService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Authentication MUST run before authorization in the middleware pipeline.
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");
