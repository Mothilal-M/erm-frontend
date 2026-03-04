"""Centralized InjectQ container configuration."""

from __future__ import annotations

from injectq import InjectQ
from injectq.modules import SimpleModule


container = InjectQ.get_instance()

_modules_installed = False


def ensure_app_modules() -> None:
    """Install application service bindings once per process."""
    _check_and_install()


def _check_and_install() -> None:
    global _modules_installed  # noqa: PLW0603
    if _modules_installed:
        return

    module = SimpleModule()
    container.install_module(module)
    _modules_installed = True


__all__: list[str] = ["container", "ensure_app_modules"]
