namespace AacApi.Models
{
    public class Board
    {
        public int Id { get; set; }

        public int ProfileId { get; set; }

        public int? ParentBoardId { get; set; }

        public string Name { get; set; } = "";

        public bool IsRoot { get; set; }

        public List<List<CommunicationCard>> Cards { get; set; } =
            new List<List<CommunicationCard>>
            {
                // כל מופע של Board מתחיל עם שלוש שורות ריקות. ה־Controller יכניס כל כרטיס לשורה המתאימה לפי SlotIndex
                new List<CommunicationCard>(),
                new List<CommunicationCard>(),
                new List<CommunicationCard>()
            };
 
    
    }
}