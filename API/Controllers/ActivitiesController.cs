using Microsoft.AspNetCore.Mvc;
using Persistence;
using Domain;
using Microsoft.EntityFrameworkCore;
using MediatR;
using Application.Activities;

namespace API.Controllers
{
  public class ActivitiesController : BaseAPIController
  {
    [HttpGet]
    public async Task<ActionResult<List<Domain.Activity>>> GetActivities()
    {
      return await Mediator.Send(new List.Query());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Domain.Activity>> GetActivityById(Guid id)
    {
      return await Mediator.Send(new Details.Query() { Id = id });
      // return Ok();
    }

    [HttpPost]
    public async Task<IActionResult> CreateActivity(Activity activity)
    {
      return Ok(await Mediator.Send(new Create.Command() { Activity = activity }));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> EditActivity(Guid id, Activity activity)
    {
      activity.Id = id;
      return Ok(await Mediator.Send(new Edit.Command() { Activity = activity }));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteActivity(Guid id)
    {
      return Ok(await Mediator.Send(new Delete.Command() { Id = id }));
    }

  }
}