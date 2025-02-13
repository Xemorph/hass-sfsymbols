import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.http.view import HomeAssistantView
from homeassistant.core import async_get_hass
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN, DATA_EXTRA_MODULE_URL, LOADER_URL, LOADER_PATH, ICONS_URL, ICONLIST_URL, ICONS_PATH

LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.empty_config_schema(DOMAIN)

class ListingView(HomeAssistantView):

    requires_auth = False

    def __init__(self, url, iconpath, hass):
        self.url = url
        self.iconpath = iconpath
        self.hass: HomeAssistant = hass
        self.name = "Icon Listing"

    async def get(self, request):
        icons_list = await self.hass.async_add_executor_job(
            self.get_icons_list, self.iconpath
        )
        return icons_list

    def get_icons_list(self, iconpath):
        icons = []
        for dirpath, dirnames, filenames in walk(iconpath):
            icons.extend(
                [
                    {"name": path.join(dirpath[len(iconpath) :].lstrip("/"), fn[:-4])}
                    for fn in filenames
                    if fn.endswith(".svg")
                ]
            )
        return json.dumps(icons)

async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the SF Symbols SVG component."""
    await hass.http.async_register_static_paths(
        [StaticPathConfig(LOADER_URL, hass.config.path(LOADER_PATH), True)]
    )
    add_extra_js_url(hass, LOADER_URL)

    for iset in ["regular"]:
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    ICONS_URL + "/" + iset,
                    hass.config.path(ICONS_PATH + "/" + iset),
                    True,
                )
            ]
        )
        hass.http.register_view(
            ListingView(
                ICONLIST_URL + "/" + iset,
                hass.config.path(ICONS_PATH + "/" + iset),
                hass,
            )
        )

    return True

# Boiler template code

async def async_setup_entry(hass, entry):
    return True


async def async_remove_entry(hass, entry):
    return True

async def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Migrate old entry."""
    return True
