import logging

from homeassistant.components.http import StaticPathConfig
from homeassistant.components.http.view import HomeAssistantView
from homeassistant.helpers import config_validation as cv

import json
from os import walk, path

from .const import DOMAIN, DATA_EXTRA_MODULE_URL, LOADER_URL, LOADER_PATH, ICONS_URL, ICONLIST_URL, ICONS_PATH

LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.empty_config_schema(DOMAIN)

class ListingView(HomeAssistantView):

    requires_auth = False

    def __init__(self, url, iconpath):
        self.url = url
        self.iconpath = iconpath
        self.name = "SFSymbols Listing"

    async def get(self, request):
        """Handle GET request asynchronously."""
        hass = request.app["hass"]  # Get Home Assistant instance
        LOGGER.debug("SFSymbols listing requested at %s", self.url)

        # Run os.walk() in a separate thread
        icons = await hass.async_add_executor_job(self._lookup_icons)

        LOGGER.debug("SFSymbols found: %s", icons)
        return self.json(icons)

    def _lookup_icons(self):
        """Scan the icon directory synchronously but offload it from the event loop."""
        icons = []
        for dirpath, _, filenames in walk(self.iconpath):
            icons.extend(
                [
                    {"name": path.join(dirpath[len(self.iconpath):], fn[:-4])}
                    for fn in filenames if fn.endswith(".svg")
                ]
            )
        return icons

async def async_setup(hass, config):
    """Set up the SF Symbols component."""
    await hass.http.async_register_static_paths(
        [StaticPathConfig(LOADER_URL, hass.config.path(LOADER_PATH), True)]
    )

    # Register extra module URL
    hass.data.setdefault(DATA_EXTRA_MODULE_URL, set()).add(LOADER_URL)

    # Register the icons path asynchronously
    await hass.http.async_register_static_paths([
        StaticPathConfig(
            ICONS_URL + "/regular",
            hass.config.path(ICONS_PATH + "/regular"),
            True,
        )
    ])
    # Register the view for icons
    hass.http.register_view(
        ListingView(
            ICONLIST_URL + "/regular",
            hass.config.path(ICONS_PATH + "/regular"),
        )
    )

    return True

# Boiler template code

async def async_setup_entry(hass, entry):
    return True


async def async_remove_entry(hass, entry):
    return True

async def async_migrate_entry(hass, entry):
    """Migrate old entry."""
    return True
