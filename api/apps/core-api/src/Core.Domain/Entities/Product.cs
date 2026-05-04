using System;
using System.Collections.Generic;

namespace Core.Infrastructure;

public partial class Product
{
    public Guid Id { get; set; }

    public Guid MeiId { get; set; }

    public string Name { get; set; } = null!;

    public decimal? Cost { get; set; }

    public decimal? Price { get; set; }

    public decimal? DesiredMargin { get; set; }

    public string? Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Mei Mei { get; set; } = null!;
}
