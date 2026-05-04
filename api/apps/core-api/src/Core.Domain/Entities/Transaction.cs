using System;
using System.Collections.Generic;

namespace Core.Infrastructure;

public partial class Transaction
{
    public Guid Id { get; set; }

    public Guid MeiId { get; set; }

    public Guid? ImportId { get; set; }

    public string Type { get; set; } = null!;

    public string? Category { get; set; }

    public decimal Amount { get; set; }

    public string? Description { get; set; }

    public DateOnly Date { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Import? Import { get; set; }

    public virtual Mei Mei { get; set; } = null!;
}
