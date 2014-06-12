jQuery(document).ready(function() {
  jQuery('#short_identifier').change(function() {
    jQuery("#assignment_repository_folder").val(jQuery(this).val());
  });

  jQuery('#assignment_due_date').change(function() {
    update_due_date(jQuery(this).val());
  });

  jQuery('#assignment_section_due_dates_type').change(function() {
    toggle_sections_due_date(jQuery(this).is(':checked'));
  });

  jQuery('#persist_groups').change(function() {
    toggle_persist_groups(jQuery(this).is(':checked'));
  });

  jQuery('#persist_groups_assignment').change(function() {
    jQuery.ajax({
      url: "<%= update_group_properties_on_persist_assignments_path() %>",
      async: true,
      type: 'POST',
      data: "assignment_id=" + this.value
    });
  });

  jQuery('#is_group_assignment').change(function() {
    toggle_group_assignment(jQuery(this).is(':checked'));
  });

  toggle_group_assignment(jQuery('#is_group_assignment').is(':checked'));

  jQuery('#student_form_groups').change(function() {
    toggle_student_form_groups(jQuery(this).is(':checked'));
  });

  jQuery('#allow_remarks').change(function() {
    toggle_remark_requests(jQuery(this).is(':checked'));
  });

  jQuery('#remark_due_date').change(function() {
    check_due_date(jQuery(this).val());
  });
});

function toggle_persist_groups(persist_groups) {
  jQuery('#persist_groups_assignment').prop('disabled', !persist_groups);
  jQuery('#is_group_assignment').prop('disabled', persist_groups);
  jQuery('#is_group_assignment_style').toggleClass('disable', persist_groups);

  if (persist_groups) {
    toggle_group_assignment(false);
  }
}

function toggle_group_assignment(is_group_assignment) {
  jQuery('#is_group_assignment').prop('checked', is_group_assignment);

  jQuery('.group_properties').toggle(is_group_assignment)
                             .prop('disabled', !is_group_assignment)
                             .toggleClass('disable', !is_group_assignment);
  jQuery('#assignment_group_min').prop('disabled', !is_group_assignment);
  jQuery('#assignment_group_max').prop('disabled', !is_group_assignment);

  jQuery('#persist_groups').prop('disabled', is_group_assignment);
  jQuery('#persist_groups_assignment_style').toggleClass('disable', is_group_assignment);
}

function toggle_student_form_groups(student_form_groups) {
  jQuery('#assignment_group_min').prop('disabled', !student_form_groups);
  jQuery('#assignment_group_max').prop('disabled', !student_form_groups);
  jQuery('#group_limit_style').toggleClass('disable', !student_form_groups);
  jQuery('#group_name_autogenerated_style').toggleClass('disable', student_form_groups);
  jQuery('#assignment_group_name_autogenerated').prop('disabled', student_form_groups);

  if (student_form_groups) {
    jQuery('#assignment_group_name_autogenerated').prop('checked', true);
  }
}

function toggle_remark_requests(allow_remark_requests) {
  jQuery('#allow_remarks').prop('checked', allow_remark_requests);

  jQuery('#remark_due_date').prop('disabled', !allow_remark_requests);
  jQuery('#assignment_remark_message').prop('disabled', !allow_remark_requests);

  jQuery('#remark_properties').toggle(allow_remark_requests)
                              .toggleClass('disable', !allow_remark_requests);
}

/* This isn't being used yet... (needs to be converted to jQuery when it is) */
function toggle_automated_tests(is_testing_framework_enabled) {
  $('is_testing_framework_enabled').setValue(is_testing_framework_enabled);

  if (is_testing_framework_enabled) {
    $('tokens').removeClassName('disable');
    $('tokens_per_day').enable();

    $$('#antbuildfile_style').each(function(node) { node.removeClassName('disable'); });
    $$('#antbuildfile_style input').each(function(node) {
      $(node).enable();
    });
    $$('#antbuildprop_style').each(function(node) { node.removeClassName('disable'); });
    $$('#antbuildprop_style input').each(function(node) {
      $(node).enable();
  });
    $$('#test_files .test_file').each(function(node) { node.removeClassName('disabled'); });
    $$('#test_files .test_file input').each(function(node) {
      $(node).enable();
    });
    $$('#lib_files .test_file').each(function(node) { node.removeClassName('disabled'); });
    $$('#lib_files .test_file input').each(function(node) {
      $(node).enable();
    });
    $$('#parser_files .test_file').each(function(node) { node.removeClassName('disabled'); });
    $$('#parser_files .test_file input').each(function(node) {
      $(node).enable();
    });
  } else {
    $('tokens').addClassName('disable');
    $('tokens_per_day').disable();

    $$('#antbuildfile_style').each(function(node) { node.addClassName('disable'); });
    $$('#antbuildfile_style input').each(function(node) {
      $(node).disable();
    });
    $$('#antbuildprop_style').each(function(node) { node.addClassName('disable'); });
    $$('#antbuildprop_style input').each(function(node) {
      $(node).disable();
    });
    $$('#test_files .test_file').each(function(node) { node.addClassName('disabled'); });
    $$('#test_files .test_file input').each(function(node) {
      $(node).disable();
    });
    $$('#lib_files .test_file').each(function(node) { node.addClassName('disabled'); });
    $$('#lib_files .test_file input').each(function(node) {
      $(node).disable();
    });
    $$('#parser_files .test_file').each(function(node) { node.addClassName('disabled'); });
    $$('#parser_files .test_file input').each(function(node) {
      $(node).disable();
    });
  }
}

function update_group_properties(is_group_assignment, student_form_groups, group_min, group_max, group_name_autogenerated) {
  jQuery('#is_group_assignment').val(is_group_assignment);
  jQuery('#student_form_groups').val(student_form_groups);
  jQuery('#assignment_group_min').val(group_min)
                                 .prop('disabled', true);
  jQuery('#assignment_group_max').val(group_max)
                                 .prop('disabled', true);
  jQuery('#assignment_group_name_autogenerated').val(group_name_autogenerated);

  jQuery('#is_group_assignment').prop('disabled', true)
                                .addClass('disable');
  jQuery('#student_form_groups').prop('disabled', true);
  jQuery('#student_form_groups_style').addClass('disable');
  jQuery('#group_limit_style').addClass('disable');
  jQuery('#assignment_group_name_autogenerated').prop('disabled', true);
  jQuery('#group_name_autogenerated_style').addClass('disable');
}

function default_group_fields() {
  toggle_persist_groups(false);
  toggle_group_assignment(false);
  toggle_remark_requests(true);
}

function update_due_date(new_due_date) {
  // Does nothing if {grace, penalty_decay, penalty}_periods already created
  create_grace_periods();
  create_penalty_decay_periods();
  create_penalty_periods();

  check_due_date(new_due_date);
  grace_periods.set_due_date(new_due_date);
  penalty_decay_periods.set_due_date(new_due_date);
  penalty_periods.set_due_date(new_due_date);
  grace_periods.refresh();
  penalty_decay_periods.refresh();
  penalty_periods.refresh();
}

function toggle_sections_due_date(section_due_dates_type) {
  jQuery('#section_due_dates_information').toggle(section_due_dates_type);
}

function change_submission_rule() {
  jQuery('.period').hide();
  jQuery('.period input').prop('disabled', true);

  if (jQuery('#grace_period_submission_rule').is(':checked') === true) {
    jQuery('#grace_periods .period').show();
    if (jQuery('#grace_periods .period').length === 0) {
      jQuery('#grace_period_link').click();
    }
    jQuery('#grace_periods .period input').prop('disabled', false);
  }

  if (jQuery('#penalty_decay_period_submission_rule').is(':checked') === true) {
    jQuery('#penalty_decay_periods .period').show();
    if (jQuery('#penalty_decay_periods .period').length === 0) {
      jQuery('#penalty_decay_period_link').click();
    }
    jQuery('#penalty_decay_periods .period input').prop('disabled', false);
  }

  if (jQuery('#penalty_period_submission_rule').is(':checked') === true) {
    jQuery('#penalty_periods .period').show();
    if (jQuery('#penalty_periods .period').length === 0) {
      jQuery('#penalty_period_link').click();
    }
    jQuery('#penalty_periods .period input').prop('disabled', false);
  }
}

function notice_marking_scheme_changed(is_assignment_new, clicked_marking_scheme_type, marking_scheme_type) {
  if (is_assignment_new !== true && clicked_marking_scheme_type !== marking_scheme_type) {
    jQuery('#marking_scheme_notice').removeClass('hidden')
                                    .show();
  } else {
    jQuery('#marking_scheme_notice').hide();
  }
}

function check_due_date(new_due_date) {
  var now = new Date();
  if (Date.parseFormattedString(new_due_date) < now) {
    alert(past_due_date_edit_warning);
  }
}
