namespace Shennong.Api.DTOs;

public record SendMessageDto(string RoomId, string SenderName, string SenderRole, string Content);
public record MarkReadDto(string RoomId);
