using Microsoft.AspNetCore.Connections;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Security.Claims;

public class UserIdProvider : IUserIdProvider
{
	public string? GetUserId(HubConnectionContext connection)
	{
        return connection.GetHttpContext()?.Request.Query["access_token"];
	}
}
