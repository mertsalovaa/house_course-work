using House.DATA_ACCESS.Entities;
using Microsoft.AspNetCore.SignalR;

namespace House.API.hubs
{
    public class PairingHub : Hub
    {
        public async override Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier; // це і є user.Id з токена
            Console.WriteLine($"Connected: {Context.ConnectionId}, UserIdentifier: {userId}");
            await base.OnConnectedAsync();
        }

        //public override Task OnDisconnectedAsync(Exception? exception)
        //{
        //    return base.OnDisconnectedAsync(exception);
        //}
    }
}
