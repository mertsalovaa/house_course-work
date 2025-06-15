using Microsoft.AspNetCore.SignalR;

namespace House.API.hubs
{
    public class DeviceStateHub : Hub
    {
        public override Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            Console.WriteLine($"User {userId} connected with connectionId: {Context.ConnectionId}");
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;
            Console.WriteLine($"User {userId} disconnected");
            return base.OnDisconnectedAsync(exception);
        }
    }
}
