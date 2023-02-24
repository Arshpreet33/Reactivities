using Application.Core;
using Application.interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles
{
  public class Details
  {

    public class Query : IRequest<Result<Profile>>
    {
      public string Username { get; set; }
    }

    public class Handler : IRequestHandler<Query, Result<Profile>>
    {
      private readonly DataContext _context;
      private readonly IMapper _mapper;
      private readonly IUserAccessor __userAccessor;

      public Handler(DataContext context, IMapper mapper, IUserAccessor _userAccessor)
      {
        __userAccessor = _userAccessor;
        _mapper = mapper;
        _context = context;

      }
      public async Task<Result<Profile>> Handle(Query request, CancellationToken cancellationToken)
      {
        var user = await _context.Users.ProjectTo<Profile>(_mapper.ConfigurationProvider,
                new { currentUsername = __userAccessor.GetUserName() })
          .SingleOrDefaultAsync(x => x.Username == request.Username);

        return Result<Profile>.Success(user);
      }
    }
  }
}