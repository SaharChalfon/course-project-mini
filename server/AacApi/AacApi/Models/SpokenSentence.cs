namespace AacApi.Models
{
    public class SpokenSentence
    {
        public int Id { get; set; }

        public int ProfileId { get; set; }

        public string DisplayText { get; set; } = "";

        public string SpokenText { get; set; } = "";

        public DateTime CreatedAt { get; set; }
    }
}
