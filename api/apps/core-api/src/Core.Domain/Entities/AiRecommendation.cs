using System;
using System.Collections.Generic;

namespace Core.Infrastructure;

public partial class AiRecommendation
{
    public Guid Id { get; set; }

    public Guid MeiId { get; set; }

    public string Type { get; set; } = null!;

    public string Content { get; set; } = null!;

    public string? Metadata { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Mei Mei { get; set; } = null!;
}
