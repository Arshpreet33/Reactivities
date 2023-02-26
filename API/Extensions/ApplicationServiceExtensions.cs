using Application.Activities;
using Application.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using FluentValidation.AspNetCore;
using FluentValidation;
using Application.interfaces;
using Infrastructure.Security;
using Infrastructure.Photos;

namespace API.Extensions
{
  public static class ApplicationServiceExtensions
  {
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
    {

      // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
      services.AddEndpointsApiExplorer();
      services.AddSwaggerGen();

      services.AddDbContext<DataContext>(options =>
      {
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

        string connStr;

        // Depending on if in development or production, use either FlyIO
        // connection string, or development connection string from env var.
        if (env == "Development")
        {
          // Use connection string from file.
          connStr = config.GetConnectionString("DefaultConnection");
        }
        else
        {
          // Use connection string provided at runtime by FlyIO.
          var connUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

        DATABASE_URL: postgres://fun_activities:PI3QSBQsEVy6JB5@[fdaa:1:74f6:0:1::3]:5432/fun_activities?sslmode=disable

          // Parse connection URL to connection string for Npgsql
          connUrl = connUrl.Replace("postgres://", string.Empty);
          var pgUserPass = connUrl.Split("@")[0];
          var pgHostPortDb = connUrl.Split("@")[1];
          var pgHostPort = pgHostPortDb.Split("/")[0];
          var pgDb = pgHostPortDb.Split("/")[1];
          var pgUser = pgUserPass.Split(":")[0];
          var pgPass = pgUserPass.Split(":")[1];

          // var pgHostPortsplit = pgHostPort.Split(":");
          // var pgPort = pgHostPortsplit[pgHostPortsplit.Length - 1];

          var pgPort = pgHostPort.Substring(pgHostPort.LastIndexOf(":"));
          var pgHost = pgHostPort.Substring(0, pgHostPort.LastIndexOf(":")).Replace("[", string.Empty).Replace("]", string.Empty);

          connStr = $"Server={pgHost};Port={pgPort};User Id={pgUser};Password={pgPass};Database={pgDb};";
        }

        // Whether the connection string came from the local development configuration file
        // or from the environment variable from FlyIO, use it to set up your DbContext.
        options.UseNpgsql(connStr);
      });


      services.AddCors(opt =>
      {
        opt.AddPolicy("CorsPolicy", policy =>
          {
            policy
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()
                .WithOrigins("http://localhost:3000", "https://fun-activities.fly.dev");
          });
      });
      services.AddMediatR(typeof(List.Handler));
      services.AddAutoMapper(typeof(MappingProfiles).Assembly);

      services.AddFluentValidationAutoValidation();
      services.AddValidatorsFromAssemblyContaining<Create>();

      services.AddHttpContextAccessor();
      services.AddScoped<IUserAccessor, UserAccessor>();

      services.AddScoped<IPhotoAccessor, PhotoAccessor>();
      services.Configure<CloudinarySettings>(config.GetSection("Cloudinary"));
      services.AddSignalR();

      return services;
    }
  }
}