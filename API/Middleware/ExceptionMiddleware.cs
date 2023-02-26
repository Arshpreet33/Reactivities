using System.Net;
using System.Text.Json;
using Application.Core;

namespace API.Middleware
{
  public class ExceptionMiddleware
  {
    private readonly IHostEnvironment _env;
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
    {
      _logger = logger;
      _next = next;
      _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
      var connUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
      // Parse connection URL to connection string for Npgsql
      connUrl = connUrl.Replace("postgres://", string.Empty);
      var pgUserPass = connUrl.Split("@")[0];
      var pgHostPortDb = connUrl.Split("@")[1];
      var pgHostPort = pgHostPortDb.Split("/")[0];
      var pgDb = pgHostPortDb.Split("/")[1];
      var pgUser = pgUserPass.Split(":")[0];
      var pgPass = pgUserPass.Split(":")[1];

      var pgPort = pgHostPort.Substring(pgHostPort.LastIndexOf(":") + 1);
      var pgHost = pgHostPort.Substring(0, pgHostPort.LastIndexOf(":")).Replace("[", string.Empty).Replace("]", string.Empty);

      _logger.LogInformation("DATABASE_URL: " + Environment.GetEnvironmentVariable("DATABASE_URL"));
      _logger.LogInformation("connStr: " + $"Server={pgHost};Port={pgPort};User Id={pgUser};Password={pgPass};Database={pgDb};");

      try
      {
        await _next(context);
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, ex.Message);
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var response = _env.IsDevelopment() ?
        new AppException(context.Response.StatusCode, ex.Message, ex.StackTrace?.ToString()) :
        new AppException(context.Response.StatusCode, "Internal Server Error");

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        var json = JsonSerializer.Serialize(response, options);

        await context.Response.WriteAsync(json);
      }
    }

  }
}