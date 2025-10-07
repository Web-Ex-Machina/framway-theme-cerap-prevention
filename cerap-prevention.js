$(function(){
	if ($('.tabs.wizard').length) {
		$('.tabs.wizard').each(function(){
			let tabs = $(this).tabs('get');
			tabs.reftab    = tabs.content.tabs[0].outerHTML;
			tabs.refbutton = tabs.nav.buttons[0].outerHTML;
			tabs.min = 0;
			tabs.max = 20;

			tabs.addNewTab = function(){
				if (tabs.content.tabs.length >= tabs.max)
					return false;
				let idNewTab = tabs.content.tabs.length;
				let newTab = $(tabs.reftab);
				newTab.removeClass('active');
				newTab.find('input,select,textarea').each(function(){
					let input = this;
					input.setAttribute('id',input.getAttribute('id')+'--'+idNewTab);
					input.setAttribute('name',input.getAttribute('name').replace(/_\d*$/gm,'_'+idNewTab+''));
				})
				newTab.find('select[data-select2-id]').each(function(){
					let input = this;
					input.removeAttribute('data-select2-id');
					input.classList.remove('select2-hidden-accessible');
					$(input).closest('.select2FW-wrapper').replaceWith(input);
				})
				newTab.find('label[for]').each(function(){
					this.setAttribute('for',this.getAttribute('for')+'--'+idNewTab)
				})
				
				tabs.content.$el.append($('<div></div>').html(newTab));
				newTab.unwrap()
				
				if (typeof intlTelInput !== "undefined") {
					initIntlInputs(document.querySelectorAll("input[type=tel]:not(.ready)"));
				}

				let buttonNewTab = $(tabs.refbutton);
				buttonNewTab.removeClass('active')
				buttonNewTab.find('.tab__number').html(idNewTab+1);
				buttonNewTab.attr('title',buttonNewTab.text())
				tabs.nav.$el.append(buttonNewTab);
				buttonNewTab.before(' ');

				tabs.updateTabsState()
				buttonNewTab.trigger('click');
			}

			tabs.updateTabsState = function(){
				tabs.nav.$el.find('.tabs__action').appendTo(tabs.nav.$el);
				tabs.nav.buttons = tabs.nav.$el.find('button,.nav__button').not('.exclude');
				tabs.content.tabs = tabs.content.$el.find('.tab').filter(function(){
					return $(this).closest('.tabs__content').get(0) == tabs.content.$el.get(0);
				});
			}

			tabs.removeTab = function(tab){
				if (tabs.content.tabs.length>tabs.min) {
					tab.remove();
					tabs.nav.buttons.last().remove();
					tabs.updateTabsState();
					if (!tabs.nav.$el.find('.active').length) 
						tabs.nav.buttons.last().trigger('click');
				}
			}

			tabs.$el.find('.tabs__action[data-action=addTab]').on('click',function(){
				tabs.addNewTab();
			});
			
		})
	}
	if ($('.tabs.wizard.candidate').length) {
		if ($('input[name=numberInterns]').length) {
			let tabs = $('.tabs.wizard.candidate').tabs('get');

			tabs.min = $('input[name=numberInterns]').attr('min');
			tabs.max = $('input[name=numberInterns]').attr('max');

			tabs.$el.find('.tabs__action[data-action=addTab]').on('click',function(){
				if ($('input[name=numberInterns]').val() != tabs.nav.buttons.length)
					$('input[name=numberInterns]').val(tabs.nav.buttons.length)
			});

			$('input[name=numberInterns]').on('change keyup',function(){
				if ($('input[name=numberInterns]').val() != tabs.nav.buttons.length && $('input[name=numberInterns]').val() > tabs.nav.buttons.length){
					for (var i = parseInt($('input[name=numberInterns]').val()) - tabs.nav.buttons.length; i > 0; i--) {
						tabs.addNewTab()
					}
				}

				if ($('input[name=numberInterns]').val() != tabs.nav.buttons.length && $('input[name=numberInterns]').val() < tabs.nav.buttons.length) {
					for (var i = tabs.nav.buttons.length - parseInt($('input[name=numberInterns]').val()); i > 0; i--) {
						tabs.removeTab(tabs.content.tabs.last())
					}
				}
			})
		}
	}


	// INTL inputs
	if (typeof intlTelInput !== "undefined") {
		var initIntlInputs = function(inputs){
			for(let i=0; i<inputs.length; i++){
				window.intlTelInput(inputs[i], {
					preferredCountries: ["fr", "gb"],
					//separateDialCode: true,
					autoPlaceholder: "aggressive",
					utilsScript: "assets/intl-tel-input/build/js/utils.js"
				});
				inputs[i].classList.add('ready')
			}
		}
		initIntlInputs(document.querySelectorAll("input[type=tel]:not(.ready)"));
		
		if ($('.splitForm input[type=tel]').length) {
			$('body').on('keyup change', '.splitForm input[type=tel]', function(e) {
				this.setCustomValidity('');
				let intl = window.intlTelInputGlobals.getInstance(this);
				if (!intl.isValidNumber()){
					this.setCustomValidity('Numéro de téléphone non valide');
					this.reportValidity()
				}
			});
		}
	}
});

