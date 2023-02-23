using MediatR;
using Persistence;
using FluentValidation;
using Application.Core;
using Application.interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Profiles
{
  public class Edit
  {

    public class Command : IRequest<Result<Unit>>
    {
      public Profile Profile { get; set; }
    }

    public class CommandValidator : AbstractValidator<Command>
    {
      public CommandValidator()
      {
        RuleFor(x => x.Profile).SetValidator(new ProfileValidator());
      }
    }

    public class Handler : IRequestHandler<Command, Result<Unit>>
    {
      private readonly DataContext _context;
      private readonly IUserAccessor _userAccessor;

      public Handler(DataContext context, IUserAccessor userAccessor)
      {
        _context = context;
        _userAccessor = userAccessor;
      }

      public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
      {
        var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == _userAccessor.GetUserName());

        if (user == null) return null;

        user.DisplayName = request.Profile.DisplayName;
        user.Bio = request.Profile.Bio;

        var result = await _context.SaveChangesAsync() > 0;

        if (!result) return Result<Unit>.Failure("Profile failed to update");

        return Result<Unit>.Success(Unit.Value);
      }
    }
  }
}