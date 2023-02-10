using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Persistence;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
  public class ActivitiesController : BaseAPIController
  {
    private readonly DataContext _context;
    public ActivitiesController(DataContext context)
    {
      _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<Domain.Activity>>> GetActivities()
    {
      return await _context.Activities.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Domain.Activity>> GetActivityById(Guid id)
    {
      return await _context.Activities.FindAsync(id);
    }

  }
}