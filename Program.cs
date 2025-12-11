using Microsoft.Extensions.FileProviders;
using CollegeAdmissions.ApiMemory.Data;
using CollegeAdmissions.ApiMemory.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// CORS � ��������� ������ ���������� � API
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "http://localhost:3000") // React dev URL
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ���������� DbContext
builder.Services.AddDbContext<AdmissionsDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// Swagger � ��� ������
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors("FrontendPolicy");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

// ? �������������� �������� �� � ������ (��� ��������)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AdmissionsDbContext>();
    db.Database.EnsureCreated();
}

// POST /api/applications � ���� ������
app.MapPost("/api/upload", async (IFormFile file) =>
{
    if (file == null || file.Length == 0)
        return Results.BadRequest("Файл не выбран");

    var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
    
    var fileName = $"{Guid.NewGuid()}_{file.FileName}";
    var filePath = Path.Combine(uploadsPath, fileName);

    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    return Results.Ok(new { fileName });
})
.DisableAntiforgery(); 


// GET /api/applications � ������ ���� ������
app.MapGet("/api/applications", async (AdmissionsDbContext db) =>

{

    var list = await db.Applications

        .OrderByDescending(a => a.CreatedAt)

        .ToListAsync();



    return Results.Ok(list);

});



app.Run();