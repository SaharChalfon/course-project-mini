namespace AacApi.Models
{
    public class UpdateCardRequest
    {
        public string Label { get; set; } = "";

        public string SpokenText { get; set; } = "";

        public string? ImagePath { get; set; }

        public string CardType { get; set; } = "content";
    }
}