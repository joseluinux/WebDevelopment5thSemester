using System;
using System.Collections.Generic;

namespace Core.Infrastructure;

public partial class Employee
{
    public Guid Id { get; set; }

    public Guid MeiId { get; set; }

    public string Name { get; set; } = null!;

    public string? ContractType { get; set; }

    public decimal? Salary { get; set; }

    public decimal? Charges { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Mei Mei { get; set; } = null!;
}
