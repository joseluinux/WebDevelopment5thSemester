using System.Text;
using Core.Application.Auth;
using Core.Application.UseCases.Auth.GetMe;
using Core.Application.UseCases.Auth.Login;
using Core.Application.UseCases.Auth.Register;
using Core.Domain.Interfaces;
using Core.Infrastructure.Persistence;
using Core.Infrastructure.Persistence.Repositories;
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
builder.Services.AddScoped<RegisterHandler>();
builder.Services.AddScoped<LoginHandler>();
builder.Services.AddScoped<GetMeHandler>();

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

app.Run();
