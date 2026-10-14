"""Ejecuta el batch diario a la hora RUN_AT_UTC (por defecto 00:30 UTC),
procesando el día anterior completo."""
import os
import time
import traceback
from datetime import datetime, timedelta, timezone

from . import daily

RUN_AT = os.environ.get("RUN_AT_UTC", "00:30")


def next_run(now: datetime) -> datetime:
    hh, mm = (int(x) for x in RUN_AT.split(":"))
    target = now.replace(hour=hh, minute=mm, second=0, microsecond=0)
    return target if target > now else target + timedelta(days=1)


def main():
    print(f"Planificador activo; batch diario a las {RUN_AT} UTC", flush=True)
    while True:
        now = datetime.now(timezone.utc)
        target = next_run(now)
        time.sleep((target - now).total_seconds())
        try:
            daily.run(target.date() - timedelta(days=1))
        except Exception:
            traceback.print_exc()


if __name__ == "__main__":
    main()
