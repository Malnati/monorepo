.PHONY: help build start stop clean

help:
	@echo "Available targets: build start stop clean"

build:
	@echo "No build pipeline is defined yet; add project-specific steps when components are introduced."

start:
	@echo "No runtime services are defined yet; configure start commands once applications are added."

stop:
	@echo "No runtime services are running; add stop commands alongside future start targets."

clean:
	@echo "No build artifacts to clean; extend this target when build outputs are created."
