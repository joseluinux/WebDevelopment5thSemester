using System;
using System.Collections.Generic;

namespace Core.Infrastructure;

public partial class Import
{
    public Guid Id { get; set; }

    public Guid MeiId { get; set; }

    public string FileUri { get; set; } = null!;

    public string Status { get; set; } = null!;

    public int? TotalRows { get; set; }

    public int? ProcessedRows { get; set; }

    public string? Errors { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Mei Mei { get; set; } = null!;

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
