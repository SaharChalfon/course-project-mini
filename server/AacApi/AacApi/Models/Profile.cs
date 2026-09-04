namespace AacApi.Models
{
    public class Profile
    {
        private int _id;
        private string _name = "";
        private string? _imagePath;  // סימן ? אומר שמותר ל־ImagePath להכיל null, משום שלפרופיל לא חייבת להיות תמונה
        private DateTime _createdAt;

        public int Id
        {
            get
            {
                return _id;
            }

            set
            {
                _id = value;
            }
        }

        public string Name
        {
            get
            {
                return _name;
            }

            set
            {
                _name = value;
            }
        }

        public string? ImagePath  // סימן ? אומר שמותר ל־ImagePath להכיל null, משום שלפרופיל לא חייבת להיות תמונה
        {
            get
            {
                return _imagePath;
            }

            set
            {
                _imagePath = value;
            }
        }

        public bool PredictionEnabled { get; set; }

        public DateTime CreatedAt
        {
            get
            {
                return _createdAt;
            }

            set
            {
                _createdAt = value;
            }
        }

    }
}
