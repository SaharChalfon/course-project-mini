namespace AacApi.Models
{
    public class CreateProfileRequest
    {
        private string _name = "";

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
    }
}