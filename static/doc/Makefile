%.png: *.gv
	dot -Tpng $< -v -o $@

%.svg: *.gv
	dot -Tsvg $< -v -o $@

.PHONY: all
all:
	make timeline.svg timeline.png
