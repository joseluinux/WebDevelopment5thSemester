using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Core.Infrastructure.Persistence.Migrations
{
    // Migration that introduces the refresh_tokens table.
    //
    // Why this file is hand-trimmed:
    // The rest of the schema was originally scaffolded from an existing
    // Supabase database, so there is no prior migration baseline. A fresh
    // `dotnet ef migrations add` therefore emitted CreateTable for every
    // entity in the model. We intentionally keep only the refresh_tokens DDL
    // here — every other table already exists in Supabase. The model snapshot
    // (AppDbContextModelSnapshot.cs) is left as-is so future migrations
    // continue to compute correct deltas against the full model.
    public partial class AddRefreshTokens : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    is_revoked = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("refresh_tokens_pkey", x => x.id);
                    // Cascade delete: if a user row is removed, every refresh
                    // token for that user goes with it. Orphan auth records
                    // are a security liability, so we never keep them.
                    table.ForeignKey(
                        name: "refresh_tokens_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Hot lookup path: every /refresh and /logout call filters by token.
            // Unique enforces "no two rows share a token string" — collisions
            // on 64-byte CSPRNG output are vanishingly unlikely, but a bug
            // anywhere in token issuance would surface as a constraint
            // violation rather than silent reuse.
            migrationBuilder.CreateIndex(
                name: "refresh_tokens_token_key",
                table: "refresh_tokens",
                column: "token",
                unique: true);

            // FK-side index — speeds up queries that filter by user
            // (audit trails, future "revoke all sessions" admin actions).
            migrationBuilder.CreateIndex(
                name: "idx_refresh_tokens_user_id",
                table: "refresh_tokens",
                column: "user_id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // DropTable also drops the table's indexes and FK constraints.
            migrationBuilder.DropTable(
                name: "refresh_tokens");
        }
    }
}
