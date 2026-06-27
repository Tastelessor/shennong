using Microsoft.AspNetCore.Mvc;

namespace Shennong.Api.Controllers;

[ApiController]
[Route("api/clinic-locations")]
public class ClinicController : ControllerBase
{
    [HttpGet]
    public IActionResult GetLocations()
    {
        var locations = new[]
        {
            new
            {
                id = 1,
                name = "Shen Nong TCM · Sylhet HQ",
                address = "Syhlet 3100, Zinda Bazar Road, Al-Hamra Shopping Complex, 1st Floor, Sylhet, Bangladesh",
                lat = 24.8995,
                lng = 91.8719
            },
            new
            {
                id = 2,
                name = "Shen Nong TCM · Airport Branch",
                address = "Syhlet 3101, Airport Road, Opposite Osmani Airport, Sylhet, Bangladesh",
                lat = 24.9633,
                lng = 91.8664
            },
            new
            {
                id = 3,
                name = "Shen Nong TCM · Amberkhana Branch",
                address = "Syhlet 3102, Amberkhana, Shahjalal Upashahar Main Gate, Sylhet, Bangladesh",
                lat = 24.9180,
                lng = 91.8807
            }
        };
        
        return Ok(locations);
    }
}
