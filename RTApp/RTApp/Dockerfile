#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM --platform=linux/arm64 mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 5000

FROM --platform=linux/arm64 mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["RTApp/RTApp.csproj", "RTApp/"]
RUN dotnet restore "./RTApp/./RTApp.csproj"
COPY . .
WORKDIR "/src/RTApp"
RUN dotnet build "./RTApp.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM --platform=linux/arm64 build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./RTApp.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM --platform=linux/arm64 base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "RTApp.dll"]