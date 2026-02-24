"""
config/logger.py
----------------
Structured logger factory for ScholarSync backend.

Usage:
    from config.logger import get_logger
    log = get_logger("MY_MODULE")
    log.info("Server started")      # [INF] 2024-01-01 00:00:00 MY_MODULE: Server started
    log.warning("Retrying: %s", e)  # [WAR] ...
    log.error("Failed: %s", e)      # [ERR] ...
    log.debug("Raw payload: %s", d) # [DEV] ...
"""

import logging
import sys


class _PrefixFormatter(logging.Formatter):
    """Prepend a bracketed severity tag to every log message."""

    _TAGS = {
        logging.DEBUG:    "[DEV]",
        logging.INFO:     "[INF]",
        logging.WARNING:  "[WAR]",
        logging.ERROR:    "[ERR]",
        logging.CRITICAL: "[ERR]",
    }

    def format(self, record: logging.LogRecord) -> str:
        tag = self._TAGS.get(record.levelno, "[INF]")
        record.msg = f"{tag} {record.msg}"
        return super().format(record)


def get_logger(name: str) -> logging.Logger:
    """Return a named logger with structured prefix formatting.

    Calling this multiple times with the same *name* always returns the
    same logger instance (standard Python logging behaviour).
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(
            _PrefixFormatter(
                fmt="%(asctime)s %(name)s: %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
        )
        logger.addHandler(handler)
        logger.setLevel(logging.DEBUG)
        logger.propagate = False
    return logger
