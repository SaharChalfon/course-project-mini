namespace AacApi.Models
{
    public class CommunicationCard
    {
        public int Id { get; set; }

        public int BoardId { get; set; }

        public string CardType { get; set; } = "";

        public int? TargetBoardId { get; set; }

        public string Label { get; set; } = "";

        public string SpokenText { get; set; } = "";

        public string? ImagePath { get; set; }

        public int SlotIndex { get; set; }
    }
}