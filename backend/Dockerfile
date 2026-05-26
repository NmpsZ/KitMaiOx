FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["KitmaiOx.API.csproj", "./"]
RUN dotnet restore "KitmaiOx.API.csproj"

COPY . .
WORKDIR "/src/"
RUN dotnet publish "KitmaiOx.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Render exposes Web Services on PORT environment variable, defaults to 10000 but .NET 8 expects 8080.
# We will tell ASP.NET Core to bind to 8080.
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "KitmaiOx.API.dll"]
